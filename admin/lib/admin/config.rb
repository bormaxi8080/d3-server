require "singleton"
require "yajl"

module Admin
  class Config
    class SocialNetworkNotFound < ArgumentError; end

    include Singleton

    attr_reader :application

    def init_from_file(config_path, game_server)
      @application = YAML.load(File.read(config_path))
      # settings = game_server.get_config
      # @application.merge! settings.stringify_keys
    end
  end
end
