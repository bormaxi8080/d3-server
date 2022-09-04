class HashDictionary

  def initialize(file_path)
    @stats_map = JSON.parse(File.read(file_path)).invert
  end

  def stats_map_key(key)
    if @stats_map.include?(key)
      @stats_map[key]
    else
      key
    end
  end

  def convert_data(data)
    json = JSON.parse(data.gsub("'", '"'))
    converted_params = {}
    # if json.has_key?('params')
    #   json['params'].each do |key, item|
    #     converted_params[stats_map_key(key)] = item
    #   end
    #   if converted_params.has_key?('result')
    #     converted_result = {}
    #     converted_params['result'].each do |key, item|
    #       converted_result[stats_map_key(key)] = item
    #     end
    #     converted_params['result'] = converted_result
    #   end
    #   json['params'] = converted_params
    # end
    json.each do |key, item|
      converted_params[stats_map_key(key)] = item
    end
    converted_params
  rescue ::Exception => e
    Rails.logger.debug e
    nil
  end
end