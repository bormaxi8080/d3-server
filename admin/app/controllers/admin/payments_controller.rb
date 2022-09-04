module Admin
  class PaymentsController < ApplicationController
    # restrict_action any: %w(support tester admin)

    def index
      if exist_core_user?
        payments = game_server.get_payments({ social_id: current_core_user['social_id'] })
        unless payments.kind_of?(Array) && payments.size
          flash.now[:alert] = 'Payments for current user not found'
        end
      else
        payments = []
      end

      respond_to do |format|
        format.html {
          @user = current_core_user
          @payments = payments
        }
        format.json { render json: { user: @user, payments: @payments }}
      end
    end

    def find
      if params[:payment_code].empty?
        redirect_to payments_path, alert: 'Payment code is empty'
        return
      end

      payments = game_server.get_payments({
        social_id: current_core_user['social_id'], payment_code: params[:payment_code]
      })

      if payments && payments.size
        respond_to do |format|
          format.html {
            @user = current_core_user
            @payment = payments[0]
          }
          format.json { render json: { user: @user, payment: @payment } }
        end
      else
        redirect_to payments_path, alert: 'Payment transaction was not found'
      end
    end
  end
end
