import { PushNotificationPayload } from '../types';

export const NotificationService = {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  sendPush(title: string, body: string, category: string = 'general'): PushNotificationPayload {
    const payload: PushNotificationPayload = {
      id: 'notif-' + Date.now(),
      title,
      body,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category,
      read: false,
    };

    // Attempt system notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://lh3.googleusercontent.com/aida/AEtjO1XOgxYNMK-cLAacI8BhU17eOa1dkVKa1uZiB9kwZ3BJzFSGHTaDeLZ4synIMTsvrq-g5prpGRzPAS8WK922YhQ2rd9glwRzQke98kvpdpV8A0Ah0auONXJmFcZjnxqcGL2DgyopAxwVIfqKkTmwpqvbyYAd_vufPwb6DvoMk6qnzq1xjyDz5ylb5n2Nr_JsMc0NTt0DX0lrdgBSKRahTOlGQqoib39N8tN0rPlq23nC4wyAXhtrxzPdlwO4',
        });
      } catch (e) {
        console.warn('Native notification error:', e);
      }
    }

    return payload;
  },

  // Automated Broadcast API Simulation
  dispatchBroadcastCampaign(campaignName: string, message: string, targetSegment: string): {
    success: boolean;
    sentCount: number;
    campaignId: string;
    timestamp: string;
  } {
    const sentCount = targetSegment === 'all' ? 1420 : targetSegment === 'pro' ? 840 : 580;
    return {
      success: true,
      sentCount,
      campaignId: 'camp_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
  }
};
