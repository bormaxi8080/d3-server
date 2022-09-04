module Dump
  class Formatter

    def for_view(context)
      raise NotImplementedError
    end

    def for_save(context)
      raise NotImplementedError
    end

    #default behavior for normal formatter
    def errors?
      [].any?
    end

  end

end