require 'spec_helper'

describe 'admin/stats/errors' do
  it 'render partials' do
    assign(:start_date, DateTime.current)
    assign(:end_date, DateTime.current)
    assign(:vertica_games, [:vk, 1])
    render
    expect(view).to render_template(partial: '_menu', count: 1)
    expect(view).to render_template(partial: '_form', count: 1)
  end
end