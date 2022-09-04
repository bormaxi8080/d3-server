default_run_options[:shell] = "sudo -u seo env PATH=/usr/local/ruby/1.9.3/bin:$PATH env HOME=/home/seo TMPDIR=/tmp bash "
server "web85.socialquantum.com", :web, :app, :db
set :knock_port, 1703
on :start, "deploy:knock_port"

set :bunyan_bin_path, "#{shared_path}/node_modules/bunyan/bin/bunyan"

