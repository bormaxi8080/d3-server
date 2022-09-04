module Dump
  class SimpleModeFormatter < Formatter
    AVAILABLE_FIELDS = {
      'player' => {
        'food' => 0,
        'level' => 0,
        'exp' => 0,
        'total_exp' => 0,
        'game_balance' => 0,
        'real_balance' => 0
      }
    }

    def for_view(context)
      AVAILABLE_FIELDS.intersection(context.current_dump)
    end

    def for_save(context)
      filtered_dump = AVAILABLE_FIELDS.intersection(context.edited_dump)
      context.current_dump.deep_merge!(filtered_dump)
      context.current_dump
    end

  end
end