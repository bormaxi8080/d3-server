server "192.168.1.50", :web, :app, :db
set :user, 'sq'

set :bunyan_bin_path, "#{shared_path}/node_modules/bunyan/bin/bunyan"

