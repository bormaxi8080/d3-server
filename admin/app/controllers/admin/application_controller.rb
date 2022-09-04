require 'yajl'

FakeUser = Struct.new(:email)

module Admin
  class ApplicationController < ActionController::Base
    # authorize_action any: %w(designer support tester admin)
    alias_method :squard_current_user, :current_user

    def current_user
      # @squard_user = squard_current_user
      @squard_user = FakeUser.new("username@example.com")
      if @squard_user
        unless @squard_user.class == 'Admin::User'
          current_user = Admin::User.from_squard_user(@squard_user)
        end
        current_user
      end
    end

    def current_core_user
      unless @current_core_user
        if session[:current_core_user] && session[:current_core_user].has_key?('social_id')
          @current_core_user = session[:current_core_user]
        end
      end
      @current_core_user
    end

    def error
      @error
    end

    def redirect_to_back_url
      begin
        redirect_to :back
      rescue ActionController::RedirectBackError
        redirect_to root_path
      end
    end

    helper_method :redirect_to_back_url, :current_core_user, :exist_core_user?

    private

    def application_server
      unless @application_server
        @application_server = Admin::Config.instance.application[:admin][:application_server]
        @application_server = @application_server.constantize
      end
      @application_server
    end

    def exist_core_user?
      !current_core_user.nil?
    end

    def game_server
      GameServer.instance
    end

    def backup_user(social_id, comment, &on_error_block)
      response = game_server.backup_user(social_id, comment)
      unless response.to_s == 'OK'
        yield response
      end
    end

  end
end
