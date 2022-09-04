Eye.load('common.rb')

app_config = {
    server: {
       script: 'Server.js',
       port: [7020, 7021],
       log_file: 'logs/node_app.log'
    }
}

Eye.config do
  logger File.join(SERVER_WORK_DIR, 'logs/eye.log')
end

Eye.app 'alpha' do
  working_dir SERVER_WORK_DIR
  env 'NODE_ENV' => 'alpha'
  env 'TMPDIR' => '/tmp'
  NODE = '/usr/bin/node'

  stop_on_delete true

  triggers :flapping, :times => 10, :within => 1.minute
  checks :memory, :below => 300.megabytes, :every => 30.seconds, :times => [3, 5]

  group :servers do
    chain :action => :restart, :grace => 5.seconds
    chain :action => :start, :grace => 0.2.seconds

    if app_config[:server][:port].respond_to?(:each)
      app_config[:server][:port].each do |p|
        nodejs self, app_config[:server], p
      end
    else
      nodejs self, app_config[:server]
    end
  end
end