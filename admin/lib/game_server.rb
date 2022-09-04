class GameServer
  #@TODO response class
  include Singleton

  attr_reader :current_connection

  def establish_connection(config)
    return @current_connection if @current_connection
    @config = config
    @current_connection = Faraday.new(url: config['backend']) do |faraday|
      faraday.request  :url_encoded
      faraday.response :logger
      faraday.adapter  Faraday.default_adapter
    end
    raise ConnectionNotEstablish.new 'Server is not available' unless /OK/.match(ping)
  end

  def create_connection(config)
    @connections << self.establish_connection(config)
  end

  def ping
    post @config['ping_url']
  end

  def get_config
    post 'get_config'
  end

  def get_user(social_id, network_code = 'Hybrid')
    response = post('get_user', { social_network: 5, social_id: social_id, network_code: network_code })
    if (response.kind_of?(Hash) && response.has_key?('error'))
      {}
    else
      response
    end
  end

  def get_user_dump(social_id, to_social_id = nil)
    response = post 'user_dump', { social_id: social_id, to_social_id: to_social_id }
    if response.kind_of?(Hash) && response.has_key?('error')
      false
    else
      response
    end
  end

  def backup_user(social_id, comment)
    post 'states_save_as', { social_network: 5, social_id: social_id, comment: comment }
  end

  def get_backup_list(social_id)
    post 'states_list', { social_network: 5, social_id: social_id }
  end

  def load_backup(social_id, id)
    post 'states_load', { social_network: 5, social_id: social_id, id: id }
  end

  def save_user_dump(social_id, dump, current_room)
    post 'save_state', { social_network: 5, social_id: social_id, state: dump, room_id: current_room }
  end

  def available_users_count(params)
    post 'test-migrations/available-users-count', params
  end

  def get_dumps(params)
    post 'test-migrations/download-dump', params
  end

  def get_defs(platform, client_version, def_type)
    post 'get_defs', { category: platform, client_version: client_version, def_type: def_type }
  end

  def create_new_service(params)
    post 'add_services_to_users', params
  end

  def get_payments(params)
    post 'get_payments', params
  end

  #exceptions
  class ConnectionNotEstablish < StandardError; end

  private

  def parse_response(response)
    begin
      gz = Zlib::GzipReader.new(StringIO.new(response.body))
      JSON.parse(gz.read)
    rescue Zlib::GzipFile::Error
      begin
        JSON.parse(response.body)
      rescue JSON::ParserError
        response.body
      end
    end
  end

  def calc_sig(params)
    s = ''
    params.delete('internal_sig')

    params.sort.each { |k, v|
      s += k.to_s + '=' + v.to_s
    }

    s += @config['internal_sig']

    sig = Digest::MD5.hexdigest(s)
    sig
  end

  def post(url, params = nil)
    params ||= {}
    params[:category] = 'admin' if params[:category].nil?
    params[:internal_sig] = calc_sig(params)
    response = @current_connection.post(url, params)
    parse_response(response)
  end

end
