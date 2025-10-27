import { useEffect } from 'react';
import { useSocketConnection } from '../core/socketConnection';
import toast from 'react-hot-toast';

// Employment/Jobs socket functionality
export const useEmployment = () => {
  const { socket, isConnected } = useSocketConnection();

  useEffect(() => {
    if (!socket) return;

    // Employment events
    const handleJobApplicationReceived = (data) => {
      console.log('📋 New job application:', data);
      toast.success(`New application for "${data.job.title}" from ${data.applicant.username}`);
      window.dispatchEvent(new CustomEvent('job_application_received', { detail: data }));
    };

    const handleJobApplicationResponded = (data) => {
      console.log('✅ Job application responded:', data);
      const action = data.action === 'accept' ? 'accepted' : 'rejected';
      toast.success(`Your application for "${data.job.title}" has been ${action}`);
      window.dispatchEvent(new CustomEvent('job_application_responded', { detail: data }));
    };

    const handleJobPosted = (data) => {
      console.log('💼 New job posted:', data);
      window.dispatchEvent(new CustomEvent('job_posted', { detail: data }));
    };

    const handleJobClosed = (data) => {
      console.log('🔒 Job closed:', data);
      toast.info(`Job "${data.job.title}" has been closed`);
      window.dispatchEvent(new CustomEvent('job_closed', { detail: data }));
    };

    const handleInterviewScheduled = (data) => {
      console.log('🗓️ Interview scheduled:', data);
      toast.success(`Interview scheduled for "${data.job.title}"`);
      window.dispatchEvent(new CustomEvent('interview_scheduled', { detail: data }));
    };

    const handleJobOfferReceived = (data) => {
      console.log('🎉 Job offer received:', data);
      toast.success(`Job offer received for "${data.job.title}"!`);
      window.dispatchEvent(new CustomEvent('job_offer_received', { detail: data }));
    };

    // Add event listeners
    socket.on('job_application_received', handleJobApplicationReceived);
    socket.on('job_application_responded', handleJobApplicationResponded);
    socket.on('job_posted', handleJobPosted);
    socket.on('job_closed', handleJobClosed);
    socket.on('interview_scheduled', handleInterviewScheduled);
    socket.on('job_offer_received', handleJobOfferReceived);

    // Cleanup
    return () => {
      socket.off('job_application_received', handleJobApplicationReceived);
      socket.off('job_application_responded', handleJobApplicationResponded);
      socket.off('job_posted', handleJobPosted);
      socket.off('job_closed', handleJobClosed);
      socket.off('interview_scheduled', handleInterviewScheduled);
      socket.off('job_offer_received', handleJobOfferReceived);
    };
  }, [socket]);

  // Employment methods
  const applyForJob = (jobId, coverLetter = '', resume = null) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('apply_for_job', {
        jobId,
        coverLetter,
        resume
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const respondToJobApplication = (applicationId, action, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('respond_job_application', {
        applicationId,
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

  const scheduleInterview = (applicationId, interviewDate, interviewType = 'video', notes = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('schedule_interview', {
        applicationId,
        interviewDate,
        interviewType,
        notes
      }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  };

  const sendJobOffer = (applicationId, salary, startDate, benefits = '', message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('send_job_offer', {
        applicationId,
        salary,
        startDate,
        benefits,
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

  const respondToJobOffer = (offerId, action, message = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('respond_job_offer', {
        offerId,
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

  return {
    isConnected,
    applyForJob,
    respondToJobApplication,
    scheduleInterview,
    sendJobOffer,
    respondToJobOffer
  };
};

export default useEmployment;
