require 'spec_helper'

describe 'admin/stats/real' do
  it 'render partials' do
      assign(:start_date, DateTime.current)
    assign(:end_date, DateTime.current)
    assign(:vertica_games, [:ios, 1])
    render
    expect(view).to render_template(partial: '_real_form', count: 1)
  end
end