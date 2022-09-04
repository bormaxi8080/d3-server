module Dump
  class FormatterFactory

    def self.create(current_user, current_core_user, game_server, params)
      if params[:group].to_i == 1
        islands = game_server.get_defs(current_core_user['client_type'], current_core_user['version'], 'islands')
        return Dump::NilFormatter.new(islands['msg']) if islands.has_key?('error')
        Dump::GroupMapFormatter.new(islands)
      elsif params[:simple].to_i == 1
        Dump::SimpleModeFormatter.new
      elsif current_user.has_any_role?(['admin', 'tester']) || Rails.env == 'development'
        Dump::DefaultFormatter.new
      else
        Dump::NilFormatter.new('You dont have permission for view dump in normal mode')
      end
    end
  end

end
