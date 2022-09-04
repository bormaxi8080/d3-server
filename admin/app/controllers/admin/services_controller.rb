module Admin
  class ServicesController < ApplicationController
    # restrict_action any: %w(support tester admin)

    def index
      @user = current_core_user

      to_node_params = {
        :social_network => 5,
        :social_id      => @user['social_id'],
      }

      ret = Admin::ToNode.post('services_list', to_node_params)
      begin
          @json_dump = Yajl::Parser.parse(ret)
      rescue
          @error = ret
      end

      @ret = ret
    end

    def new
      @errors = []
    end

    def save
      unless params[:level_to] || params[:level_from]
        render json: {status: 'err', msg: 'level_from and level to cannot be empty'}
      end
      response = game_server.create_new_service(params)
      response.symbolize_keys!
      response[:msg] = response[:error] unless response[:error].nil?
      render json: response
    end

    def save_dump
      @user = current_core_user

      to_node_params = {
        :social_network => 5,
        :social_id      => @user['social_id'],
        :services       => params[:state]
      }

      ret = Admin::ToNode.post('services_save', to_node_params)

      begin
          @result = Yajl::Parser.parse(ret)

          if @result.has_key?('error')
            unless @result.has_key?('errors')
              @result['errors'] = []
            end

            @result['errors'].push({'error' => @result['error']})
          end
      rescue
          @result = {'status' => 'error', 'errors' => [{'error' => ret}]}
      end

      render :json => @result
    end

    def export_dump
      response.headers['Content-Disposition'] = 'attachment; filename="services.json"'
      response.headers['Content-Type'] = 'application/json'

      render :text => params[:dump], :content_type => 'octet/stream'
    end
  end
end
