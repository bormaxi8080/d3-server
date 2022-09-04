set :stages, %w(beta alpha review production)
require 'capistrano/ext/multistage'
require 'yajl'
require 'yaml'
require 'socket'
require 'timeout'

set(:application) { "detective_#{stage}" }
set(:deploy_to) { "/projects/cap/#{application}" }
set(:current_path) { "#{deploy_to}/current" }
set :scm, :git
set :repository, "git@gitlab.sqtools.ru:detective.git"
ssh_options[:forward_agent] = true
set :deploy_via, :remote_cache
set :use_sudo, false
set :git_enable_submodules, 1

set :keep_releases, 3

commit = ENV['VCS_HASH'] || `git rev-parse HEAD`
raise Capistrano::Error.new "Commit #{commit} is not specified" unless commit
branch = `git branch --no-color | grep "*"`.split(' ')[1]
set :branch, branch

before "deploy:update_code", "deploy:paths"
after "deploy:update_code", "deploy:npm_install", "customs:symlink", "deploy:bundle"
after "deploy:update", "deploy:prepare"
before "deploy:restart", "deploy:load_eye"

namespace :deploy do

  task :finalize_update do; end
  task :bundle do; end

  task :knock_port do
    port = fetch(:knock_port, false)
    if port
      find_servers_for_task(current_task).each do |server|
        begin
          Timeout::timeout(2) do
            begin
              s = TCPSocket.new(server.to_s, port)
              s.close
            rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH
            end
          end
        rescue Timeout::Error
        end
      end
    end
  end

  task :paths do
    run "mkdir -p #{deploy_to}/releases"
    run "mkdir -p #{shared_path}"
  end

  task :prepare do
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake build"
  end


  desc "Start application with forever"
  task :start, :roles => :app do
    run "cd #{current_path} && eye start #{stage}:server"
  end

  desc 'Load eye config'
  task :load_eye do
    run "mkdir -p /projects/eye"
    run "ln -sf #{current_path}/deploy/config/eye/#{stage}.eye /projects/eye/#{stage}.eye"
    run "eye load /projects/eye/#{stage}.eye"
  end

  desc "Stop application"
  task :stop, :roles => :app, :except => { :no_release => true } do
    run "cd #{current_path} && eye stop #{stage}:server"
  end

  desc "Restart application"
  task :restart, :roles => :app, :except => { :no_release => true } do
    stop
    sleep 1
    db.migrate
    start
  end

  desc "Reset database"
  task :reset, :roles => :app, :except => { :no_release => true } do
    stop
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:recreate"
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:flush_cache"
    start
  end

  desc "Install npm modules"
  task :npm_install do
    run "mkdir -p #{shared_path}/node_modules"
    run "ln -s #{shared_path}/node_modules #{release_path}/server/node_modules"
    run "cd #{release_path}/server/ && npm install"
  end
end

namespace :db do
  desc "Setup database"
  task :setup, :roles => :db do
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:migrate"
  end

  desc "Drop database"
  task :drop, :roles => :db do
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:drop"
  end

  task :create, :roles => :db do
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:create"
  end

  desc 'Check new migrations'
  task :check_new_migrations, :roles => :db do
    new_migrations = capture("cd #{current_release} && NODE_ENV=#{stage} jake db:undone_migrations").to_i
    raise 'Shard have different count undone migrations' if new_migrations < 0
    puts new_migrations
    new_migrations == 0
  end

  desc 'Run migrations'
  task :migrate, :roles => :db do
    run "cd #{current_path} && NODE_ENV=#{fetch(:stage)} jake db:migrate"
  end
end

namespace :logs do

  desc "tail log files"
  task :tail, :roles => :web do
    check_bunyan
    filter = ENV["filter"] || "-o short --color"
    file = ENV["file"] || "*.log"
    run "tail -f #{shared_path}/log/#{file} | #{bunyan_bin_path} #{filter}" do |channel, stream, data|
      trap("INT") { puts 'Interupted'; exit 0; }
      puts data
      break if stream == :err
    end
  end

  desc "logs list"
  task :list do
    run "ls #{shared_path}/log | grep -v gz"
  end

  desc "check bunyan help"
  task :help do
    check_bunyan
    run "#{bunyan_bin_path} --help" do |channel, stream, data|
      puts data
    end
  end

  def remote_file_exist?(path)
    'true' ==  capture("if [ -e #{path} ]; then echo 'true'; fi").strip
  end

  def check_bunyan
    unless remote_file_exist?(bunyan_bin_path)
      raise Capistrano::Error.new <<EOF
      Logger bunyan is not installed on remote server or path #{bunyan_bin_path} is incorrect.
For installing bunyan use: npm install bunyan. Path must be found in ./node_modules/bunyan/bin/bunyan
EOF
    end
  end
end

namespace :customs do
  task :symlink do
    #logs
    run "mkdir -p #{shared_path}/log"

    run "rm -rf #{release_path}/server/logs"
    run "ln -sf #{fetch(:shared_path)}/log #{fetch(:release_path)}/server/logs"
    run "mkdir -p #{release_path}/js/custom/"

    #script versions
    run "mkdir -p #{shared_path}/sqware_scripts/pids"
    run "rm -rf #{release_path}/server/tmp"
    run "ln -sf #{shared_path}/sqware_scripts #{release_path}/server/tmp"
    run "mkdir -p #{release_path}/server/tmp/node_cdn_cache/"
  end
end
