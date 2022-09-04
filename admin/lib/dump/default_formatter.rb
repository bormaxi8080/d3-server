module Dump
  class DefaultFormatter < Formatter
    def for_view(context)
      context.current_dump
    end

    def for_save(context)
      context.edited_dump
    end
  end
end