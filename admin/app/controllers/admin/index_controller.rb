module Admin
  class IndexController < Admin::ApplicationController
    # restrict_action any: %w(designer support tester admin)

    def index
    end

  end
end
