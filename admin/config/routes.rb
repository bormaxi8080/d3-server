Rails.application.routes.draw do

  get "users/sign_out"

  scope :module => "admin" do

    resources :script

    get     "game/index"
    delete  "/sign_out" => "users#sign_out", :as => :sign_out

    scope "game" do
      resources :states, :only => [:create, :show, :index]

      get   "/"             => "game#index",        :as => :game
      get   "/change-user"  => "game#change_user",  :as => :game_change_user

      post  "/save-state"   => "game#save_state"
      delete "/reset-state" => "game#reset_state",  :as => :reset_state

      get   "/get_services" => "game#get_services"
      post  "/save_services_batch"  => "game#save_services_batch"

      # post "save_services" => "game#save_services"
    end

    scope "dump" do
      get   "/"             => "dump#edit",         :as => :dump_edit
      get   "/get"          => "dump#get",          :as => :dump_get
      post  "/upload"       => "dump#upload"
      get   "/clone"        => "dump#clone"
      post  "/apply"        => "dump#apply"
      post  "/load_backup"  => "dump#load_backup"
    end

    scope "services" do
      get   "/"             => "services#index",    :as => :services_index
      post  "/save_dump"    => "services#save_dump"
      post  "/export"       => "services#export_dump"
      get   "/new"          => "services#new",      :as => :new_services
      post  "/save"         => "services#save",     :as => :save_services
    end

    resources :static, :only => [:index, :destroy], :defaults => {:id => ""}

    scope "payments" do
      get   "/"             => "payments#index",    :as => :payments
      post  "/find"         => "payments#find",     :as => :payments_find
      get   "/:code"        => "payments#find"
    end

    root :to => "index#index"
  end
end
