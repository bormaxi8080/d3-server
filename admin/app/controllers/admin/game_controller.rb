#TODO move work with dump to dump controller
module Admin
  class GameController < Admin::ApplicationController

    # restrict_action except: [:reset_state, :save_state, :save_services_batch], any: %w(designer support tester admin)
    # restrict_action only: [:reset_state, :save_state, :save_services_batch], any: %w(support tester admin)

    def change_user
      session[:current_core_user] = nil

      response = game_server.get_user(params[:social_id], params[:network_code])
      if response.has_key?('social_id')
        session[:current_core_user] = response
      end

      if params[:redirect_url]
        redirect_to params[:redirect_url]
      else
        redirect_to_back_url
      end
    end

    def reset_state
      @user = current_core_user
      social_id = @user['social_id']

      to_node_params = {
        :social_id => social_id,
        :social_network => 5
      }

      if params['drop_friends']
        to_node_params[:drop_friends] = true
      end

      unless params[:without_backup]
        #backup user before save dump
        backup_user(current_core_user['social_id'], 'before reset dump') do |error|
          error = "Error! Backup was not created! \n#{error}"
          render json: {status: 'error', msg: error} and return
        end
      end

      #TODO refactoring
      response = Admin::ToNode.post('reset_user', to_node_params)
      if response.to_s.match(/ERROR/)
        render json: {status: 'error', msg: response} and return
      end

      flash[:notice] = 'Dump was reseted successful'
      render json: {status: 'ok'}
    end

    def save_state
      formatter = Dump::FormatterFactory.create(current_user, current_core_user, game_server, params)
      if formatter.errors?
        flash[:alert] = formatter.errors.join(' ')
        redirect_to dump_edit_path, simple: 1 and return
      end
      user = current_core_user
      edited_dump = Yajl::Parser.parse(params[:state])

      begin
        dump_container = Dump::Container.new(formatter, session[:current_edit_dump], edited_dump)
        dump = dump_container.for_save
      rescue Dump::DateParseError => e
        render :json => {:status => "error", :msg => e.message} and return
      end

      #backup user before save dump
      unless params[:without_backup]
        backup_user(current_core_user['social_id'], 'before save dump') do |error|
          render :json => {:status => "error", :msg => "Error! Backup was not created! \n#{error.to_s}"} and return
        end
      end

      response = game_server.save_user_dump(user['social_id'], dump.to_json, params[:room_id])
      if response == 'OK'
        flash[:notice] = 'Dump saved.'
        render :json => {:status => "ok"}
      else
        render :json => {:status => "error", :msg => response}
      end
    end

  end
end
