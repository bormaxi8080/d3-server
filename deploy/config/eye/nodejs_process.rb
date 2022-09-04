def nodejs(proxy, options, port=nil)
  port = port || options[:port]
  name = "nodejs_#{port}_#{proxy.app.name}"

  proxy.process(name) do
    pid_file "tmp/pids/#{name}.pid"
    env 'PORT' => port
    start_command "#{NODE} #{options[:script]} PORT=#{port}"
    stop_signals [:QUIT, 10.seconds, :TERM, 5.seconds, :KILL]
    daemonize true
    stdall options[:log_file]
    start_timeout 5.seconds
    checks :http, :url => "http://127.0.0.1:#{port}/health", :pattern => 'OK',
           :every => 25.seconds, :times => [2, 3], :timeout => 5.second
  end
end