require 'spec_helper'

describe Dump::Formatter do
  before(:all) do
    @formatter = Dump::Formatter.new
    @context = Dump::Container.new(@formatter, {}, {})
  end

  it '#for_view' do
    expect{@formatter.for_view(@context)}.to raise_error(NotImplementedError)
  end

  it '#for_save' do
    expect{@formatter.for_save(@context)}.to raise_error(NotImplementedError)
  end

end