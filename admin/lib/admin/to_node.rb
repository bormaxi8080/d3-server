#:encoding: utf-8
require 'digest/md5'
require "net/http"
require "uri"

module Admin::ToNode

  def calc_sig(params)
    # В связи с тем, что часть запросов будет идти с напрямую на ноду
    # return params[:secret_key] if params.has_key?('secret_key')

    s = ''
    params.delete(:internal_sig)

    params.sort.each do |k, v|
      s += k.to_s + '=' + v.to_s
    end
    s += Admin::Config.instance.application[:admin][:node_secret]

    sig = Digest::MD5.hexdigest(s)
    sig
  end

  def post(url, params)
    # если url неполный, то дополним его.
    host = params[:node_backend] || Admin::Config.instance.application[:admin][:node_backend]
    unless url[0, 7] == 'http://'
      if host[host.length - 1] == '/'
        url = host + url
      else
        url = host + '/' + url
      end
    end
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.read_timeout = 50000
    req_to_node = Net::HTTP::Post.new(uri.request_uri)

    if params
      params[:internal_sig] = calc_sig(params)
    else
      params = {}
    end
    req_to_node.set_form_data(params)
    response = http.request(req_to_node)
    response.body
  end

  def post_return_full_response(url, params)
    # если url неполный, то дополним его.
    host = (params.has_key?('node_backend')) ? params[:node_backend] : Admin::Config.instance.application[:admin][:node_backend]
    unless url[0, 7] == 'http://'
      if host[host.length - 1] == '/'
        url = host + url
      else
        url = host + '/' + url
      end
    end

    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    req_to_node = Net::HTTP::Post.new(uri.request_uri)

    if params
      params[:internal_sig] = calc_sig(params)
    else
      params = {}
    end

    # TODO url собирать тут, присылать снаружи только "хвостик"
    print "--== Admin::ToNode#post URL: #{url} ==--\n"
    print "--== Admin::ToNode#post PARAMS: #{params} ==--\n"

    req_to_node.set_form_data(params)
    response = http.request(req_to_node)

    print "--== Admin::ToNode#post result: #{response.body} ==--"

    response
  end

  module_function :post
  module_function :post_return_full_response
  module_function :calc_sig
end
