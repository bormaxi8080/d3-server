module Dump
  class NilFormatter < Formatter

      def initialize(error = nil)
        @errors = []
        @errors << error unless error.nil?
      end

      def errors?
        @errors.any?
      end

      def add_error(error)
        @errors << error
      end

      def errors
        @errors
      end

      def for_view(context)
      end

      def for_save(context)
      end
  end
end