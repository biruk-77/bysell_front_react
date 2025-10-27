import { useEffect } from 'react';
import { useSocketConnection } from '../core/socketConnection';
import toast from 'react-hot-toast';

// Trading/Marketplace socket functionality
export const useTrading = () => {
  const { socket, isConnected } = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Trading events
    const handleTradeRequestReceived = (data) => {
      console.log('💰 New trade request:', data);
      toast.success(`New trade request from ${data.requester.username}`);
      window.dispatchEvent(new CustomEvent('trade_request_received', { detail: data }));
    };

    const handleTradeRequestResponded = (data) => {
      console.log('✅ Trade request responded:', data);
      const action = data.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(`Trade request ${action}`);
      window.dispatchEvent(new CustomEvent('trade_request_responded', { detail: data }));
    };

    const handleTradeCompleted = (data) => {
      console.log('🎉 Trade completed:', data);
      toast.success(`Trade completed successfully!`);
      window.dispatchEvent(new CustomEvent('trade_completed', { detail: data }));
    };

    const handleTradeCancelled = (data) => {
      console.log('❌ Trade cancelled:', data);
      toast.info(`Trade cancelled`);
      window.dispatchEvent(new CustomEvent('trade_cancelled', { detail: data }));
    };

    const handleProductListed = (data) => {
      console.log('📦 Product listed:', data);
      window.dispatchEvent(new CustomEvent('product_listed', { detail: data }));
    };

    const handleProductSold = (data) => {
      console.log('💸 Product sold:', data);
      toast.success(`Your product "${data.product.title}" has been sold!`);
      window.dispatchEvent(new CustomEvent('product_sold', { detail: data }));
    };

    // Add event listeners
    socket.on('trade_request_received', handleTradeRequestReceived);
    socket.on('trade_request_responded', handleTradeRequestResponded);
    socket.on('trade_completed', handleTradeCompleted);
    socket.on('trade_cancelled', handleTradeCancelled);
    socket.on('product_listed', handleProductListed);
    socket.on('product_sold', handleProductSold);

    // Cleanup
    return () => {
      socket.off('trade_request_received', handleTradeRequestReceived);
      socket.off('trade_request_responded', handleTradeRequestResponded);
      socket.off('trade_completed', handleTradeCompleted);
      socket.off('trade_cancelled', handleTradeCancelled);
      socket.off('product_listed', handleProductListed);
      socket.off('product_sold', handleProductSold);
    };
  }, [socket]);

  // Trading methods
  const sendTradeRequest = (receiverId, productId, offerAmount, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_trade_request', {
        receiverId,
        productId,
        offerAmount,
        message
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const respondToTradeRequest = (tradeId, action, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('respond_trade_request', {
        tradeId,
        action,
        message
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const completeTrade = (tradeId) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('complete_trade', {
        tradeId
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const cancelTrade = (tradeId, reason = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('cancel_trade', {
        tradeId,
        reason
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  return {
    isConnected,
    sendTradeRequest,
    respondToTradeRequest,
    completeTrade,
    cancelTrade
  };
};

export default useTrading;
