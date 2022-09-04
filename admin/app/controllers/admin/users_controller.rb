class Admin::UsersController < Admin::ApplicationController

  skip_before_filter :exist_core_user?, :only => [:sign_out]
  def sign_out
    current_user.logout
    reset_session
    redirect_to root_path
  end

end
