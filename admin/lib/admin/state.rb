module Admin

  #monkeypatching Git
  #add functional
  #perfomance
  Git::Base.class_eval do

    def clean(options)
      self.lib.send(:command, 'clean', options)
    end

    def current_branch
      self.lib.branch_current
    end

    def pull_rebase
      self.lib.send(:command, 'pull --rebase')
    end

    def add_all
      self.lib.send(:command, 'add -A')
    end
  end

  Git::Lib.class_eval do
    def config_list
      unless @config_list
        build_list = lambda do |path|
          parse_config_list command_lines('config', %w(--list))
        end

        @config_list = if @git_dir
          Dir.chdir(@git_dir, &build_list)
        else
          build_list.call
        end
      end
      @config_list
    end
  end

  class State
    MASTER_STATE = "master"

    # see http://github.com/schacon/ruby-git
    # @param repository_path String
    # @param config Hash
    # @return Git
    def initialize(config)
      @config = config
      begin
        @git = ::Git.open(@config[:repository_path])
      rescue Exception => e
        #if path .git does not exist in repository path
        @git = false
      end
    end

    def git
      @git ||= clone
    end

    #@return Array
    def states
      return [] unless git
      git.fetch
      @states = []
      git.branches.each do |branch|
        unless /(HEAD)/.match(branch.to_s)
          @states << branch.to_s.split("/", 3).last
        end
      end
      @states.delete("master")
      @states.uniq
    end

    #@return String
    def current_state
      git.current_branch if git
    end

    def ready?
      Dir.entries(@config[:repository_path]).include?('.git')
    end

    def clean(options)
      git.clean(options)
    end

    # Clone repository
    def clone
      FileUtils.rm_rf(@config[:repository_path])
      @git = ::Git.clone(@config[:remote_path], @config[:repository_path])
      @git.config("user.email", @config[:email])
      @git.config("user.name", @config[:email])
      #init_map_editor
    end

    #delete repository path
    def remove
      FileUtils.rm_rf(@config[:repository_path])
    end

    def method_missing(name, *args, &block)
      git.send(name, *args, &block)
    end

    private
    # Create map editor folder and copy init map config file
    #def init_map_editor
    #  FileUtils.mkdir_p(File.join(@config[:repository_path], 'mapeditor'))
    #  init_user_map_path = Rails.root.join(@config[:server_config_path], Rails.env, @config[:init_map_file_name])
    #  FileUtils.cp(init_user_map_path, File.join(@config[:repository_path], 'mapeditor', 'init_user_map.json'))
    #end

  end


end