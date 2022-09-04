current_dir = File.dirname(__FILE__)
config_file = File.expand_path(File.join(current_dir, "../../../config/admin/#{Rails.env}.yml"))

unless File.exist?(config_file)
  raise "Config file #{config_file} not found!"
end

unless Rails.env == 'test'
  # init api to remote game server
  GameServer.instance.establish_connection YAML.load(File.read(config_file))['game_server']
  Admin::Config.instance.init_from_file(config_file, GameServer.instance)
end