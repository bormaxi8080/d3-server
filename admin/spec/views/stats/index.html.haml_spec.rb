require 'spec_helper'

describe 'admin/stats/index' do
  it 'render _menu partial' do
    render
    expect(view).to render_template(partial: '_menu', count: 1)
  end
end