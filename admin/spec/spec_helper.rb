# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require 'webmock/rspec'

require 'simplecov'
SimpleCov.start do
  add_group "Models", "app/models"
  add_group "Controllers", "app/controllers"
  add_group "Helpers", "app/helpers"
  add_group "Lib", "lib"
  add_filter "spec/"
end

require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'rspec/autorun'


Fabrication.configure do |config|
  config.fabricator_path = 'spec/fabricators'
  config.path_prefix = Rails.root
  config.sequence_start = 10000
end

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}
Dir[Rails.root.join("spec/fabricators/**/*.rb")].each {|f| require f}

RSpec.configure do |config|
  config.infer_base_class_for_anonymous_controllers = false
  current_dir = File.dirname(__FILE__)
  config_file = File.expand_path(File.join(current_dir, "../.././config/admin/#{Rails.env}.yml"))
  config.before(:each) {
    GameServer.instance.stub(:get_config) {{'migrations' => [], 'shards' => [], 'node_backends' => [], 'report_scripts' => []}}
    GameServer.instance.stub(:ping) {'OK'}
    GameServer.instance.stub(:get_admin_script) { {} }
    GameServer.instance.stub(:get_reports) { [] }
    GameServer.instance.stub(:get_tournaments) { [] }
    GameServer.instance.establish_connection YAML.load(File.read(config_file))['game_server']
    Admin::Config.instance.init_from_file(config_file, GameServer.instance)

    Admin::ApplicationController.any_instance.stub(:current_core_user) {Fabricate(:core_user)}
    user = Fabricate(:user)
    user.stub(:has_roles?) {true}
    user.stub(:has_any_role?) {true}
    user.stub(:is_admin?) {true}
    Admin::ApplicationController.any_instance.stub(:current_user) {user}
  }

  config.order = "random"
end
