require 'spec_helper'

describe Admin::GameController do

  # it_should_behave_like 'success response', :clone, :get
  describe "#save_state" do
    it 'when success response' do
      GameServer.instance.stub(:backup_user){'OK'}
      GameServer.instance.stub(:save_user_dump){ 'OK' }
      session[:current_edit_dump] = {}
      GameServer.instance.stub(:get_defs){{}}
      post :save_state, {state: "{}"}
      expect(response).to be_success
      expect(response.body).to eq({"status" => "ok"}.to_json)
    end

    it 'when success response with :simple=1' do
      GameServer.instance.stub(:save_user_dump){ 'OK' }
      GameServer.instance.stub(:get_defs){{}}
      GameServer.instance.stub(:backup_user){'OK'}
      session[:current_edit_dump] = {}
      post :save_state, {state: "{}", simple: 1}
      expect(response).to be_success
      expect(response.body).to eq({"status" => "ok"}.to_json)
    end

    it 'when failed response' do
      GameServer.instance.stub(:save_user_dump){ "failed" }
      GameServer.instance.stub(:get_defs){{}}
      GameServer.instance.stub(:backup_user){'OK'}
      session[:current_edit_dump] = {}
      post :save_state, {state: "{}"}
      expect(response).to be_success
      expect(response.body).to eq({"status" => "error", "msg" => "failed"}.to_json)
    end

    it 'when use NilFormatter' do
      GameServer.instance.stub(:save_user_dump){ 'OK' }
      GameServer.instance.stub(:get_defs){{}}
      Dump::FormatterFactory.stub(:create){Dump::NilFormatter.new('error')}
      session[:current_edit_dump] = {}
      post :save_state, {state: "{}"}
      expect(response).to redirect_to(dump_edit_path)
    end
  end

  describe '#change_user' do

    context 'when success' do
      it 'set current user' do
        user = { 'social_id' => 'test' }
        GameServer.instance.stub(:get_user) { user }
        post :change_user, { social_id: 'test', find_by: 'social_id' }
        expect(response).to redirect_to root_path
        expect(session[:current_core_user]).to eq(user)
      end
    end

    context 'when failed' do
      it 'change user in session to nil' do
        user_error = { 'error_code' => 'User not found' }
        GameServer.instance.stub(:get_user) { user_error }
        post :change_user, { social_id: 'test', find_by: 'social_id' }
        expect(response).to redirect_to root_path
        expect(session[:current_core_user]).to eq(nil)
      end
    end
  end

end
