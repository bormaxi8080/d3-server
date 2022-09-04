  class Evt < ActiveRecord::Base
    def self.validate_params(params)
      %w[game_id start_date end_date social_id].each do |param|
        if params[param].blank?
          return "Param #{param} cannot be blank"
        end
      end

      if self.create_date_from_string(params[:start_date]) > self.create_date_from_string(params[:end_date])
        return "end_date cannot be less then start_date"
      end

      false
    end

    def self.create_date_from_string(s)
      begin
        DateTime.strptime(s, "%d/%m/%Y %H:%M:%S")
      rescue
        false
      end
    end

  end