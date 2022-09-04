require 'json'

module Admin
  class DumpController < Admin::ApplicationController

    # restrict_action any: %w(support tester admin)

    def index; end

    def get
      to_node_params = Hash['social_id', current_core_user['social_id']]
      to_node_params.merge!(params)

      response = Admin::ToNode.post('user_dump', to_node_params)

      if response.index("error") != nil
          @errors = []
          json_dump = Yajl::Parser.parse(response)
          @errors << json_dump['error']
      else
        begin
          file_name =  "dump_#{current_core_user['social_id']}.json"
          json_dump = Yajl::Parser.parse(response)
        rescue Exception => e
          @errors = []
          logger.debug e
          json_dump = Yajl::Parser.parse(response)
          if json_dump.has_key?('error')
            @errors << json_dump['error']
          end
          @errors << "#{e.message} <br> #{to_node_params}"
        end
      end

      unless @errors
        send_data JSON.pretty_generate(json_dump),
          :type => 'application/json',
          :disposition => 'attachment',
          :filename => file_name
      end
    end

    def edit
      @backup_list = []
      if current_core_user
        @backup_list = game_server.get_backup_list(current_core_user['social_id'])

        formatter = Dump::FormatterFactory.create(current_user, current_core_user, game_server, params)
        if formatter.errors?
          flash[:alert] = formatter.errors.join(' ')
          redirect_to action: :edit, simple: 1 and return
        end
      end

      @json_dump = nil
      if current_core_user
        @json_dump = game_server.get_user_dump(current_core_user['social_id'])
        unless @json_dump
          session[:current_core_user] = nil
          flash[:alert] = "Error on get user(#{current_core_user['social_id']}) dump"
          redirect_to action: :edit and return
        end

        session[:current_edit_dump] = @json_dump
        dump_container = Dump::Container.new(formatter, @json_dump)
        @json_dump = dump_container.for_view
      end
    end

    def clone
      @errors = []
    end

    def apply
      @errors = []

      %w(from_user_id to_user_id).each do |param|
        if params[param].blank?
          @errors << "Params #{param} is required"
          render json: { status: 'error', msg: @errors.join('\n') } and return
        end
      end

      @to_user = game_server.get_user(params[:to_user_id])
      unless @to_user.any?
        @errors << "User #{params[:to_user_id]} not found"
        render json: { status: 'error', msg: @errors.join('\n') } and return
      end

      dump = game_server.get_user_dump(params[:from_user_id], params[:to_user_id])

      unless params[:without_backup]
        #backup user before save dump
        backup_user(current_core_user['social_id'], 'before clone dump') do |error|
          @errors << "Error! Backup was not created! \n" + error.to_s
          render json: { status: 'error', msg: @errors.join('\n') } and return
        end
      end

      response = game_server.save_user_dump(@to_user['social_id'], dump.to_json,
        dump['map']['options']['location']['current_room']
      )
      unless response == 'OK'
        @errors << "Dump is not clone. #{response}"
        render json: { status: 'error', msg: @errors.join('\n') } and return
      end

      flash[:notice] = "Dump was cloned from user #{params[:from_user_id]} to user #{@to_user['social_id']}"
      render json: { status: 'ok' }
    end

    def load_backup
      response = game_server.load_backup(current_core_user['social_id'], params[:id])
      unless response == 'OK'
        flash[:alert] = "Error! Backup was not loaded. #{response}"
        render json: { status: "error", msg: response }
      else
        flash[:notice] = 'Backup was loaded successfully'
        render json: { status: "ok" }
      end
    end

  end
end
