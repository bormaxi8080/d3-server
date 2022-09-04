module Dump
  class DateParseError < Exception; end
  class Container
    attr_reader :current_dump, :edited_dump

    CONVERT_DATE_KEYS = %w(
      last_visit_time
      last_seen_timestamp
      last_time_news_seen
      last_command_time
      start_date
      state_start_date
      state_expires_date
      cash_changed_time
      time
    )

    def initialize(formatter, current_dump, edited_dump = nil)
      @formatter = formatter
      @current_dump = current_dump.deep_dup
      @edited_dump = edited_dump.deep_dup unless edited_dump.nil?
    end

    def convert_date(dump, &block)
      dump.each do |key, item|
        convert_date(item, &block) if item.kind_of?(Hash)
        if CONVERT_DATE_KEYS.include?(key)
          dump[key] = yield item
        end
      end
    end

    def convert_uts_to_date(dump)
      convert_date(dump) do |item|
        if item.to_i > 0
          Time.at(item.to_i / 1000).to_datetime.strftime('%Y-%m-%d %H:%M:%S')
        else
          item
        end
      end
    end

    def convert_date_to_uts(dump)
      convert_date(dump) do |item|
        #check 2013-01-02 01:11:00
        if item.to_s.match(/\d{4}\-\d{2}\-\d{2}\ \d{2}\:\d{2}\:\d{2}/)
          begin
            Time.parse(item.to_s).to_i * 1000
          rescue ArgumentError
            raise DateParseError.new "Failed to parse date #{item}"
          end
        else
          item
        end
      end
    end

    #format dump before view
    def for_view
      convert_uts_to_date(@formatter.for_view(self))
    end

    #format dump before save
    def for_save
      return @current_dump if @edited_dump.nil?
      convert_date_to_uts(@formatter.for_save(self))
    end

  end
end