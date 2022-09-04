server "109.202.17.170", :web, :app, :db
set :user, 'sk-nsk'

set :bunyan_bin_path, "#{shared_path}/node_modules/bunyan/bin/bunyan"
default_run_options[:shell] = '/bin/bash -l'
