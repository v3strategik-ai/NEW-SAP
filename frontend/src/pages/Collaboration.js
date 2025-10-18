import { useState, useEffect } from 'react';
import axios from 'axios';
import { API, getAuthHeader } from '../App';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Activity, MessageSquare, Bell, UserCheck, TrendingUp, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';

const Collaboration = ({ user, onLogout }) => {
  const [activities, setActivities] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchData();
    // Simulate real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, onlineRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/activity/feed`, { headers: getAuthHeader() }),
        axios.get(`${API}/team/online`, { headers: getAuthHeader() }),
        axios.get(`${API}/notifications`, { headers: getAuthHeader() })
      ]);
      setActivities(activitiesRes.data);
      setOnlineUsers(onlineRes.data.online_users || []);
      setNotifications(notificationsRes.data.filter(n => !n.is_read));
    } catch (error) {
      console.error('Failed to fetch collaboration data');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'customer': return <Users className="w-4 h-4" />;
      case 'lead': return <TrendingUp className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6" data-testid="collaboration-page">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Users className="w-10 h-10 text-indigo-600" />
            Team Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mt-1">
            Real-time activity feed and team updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="activity-feed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Activity Feed
                  <Badge variant="outline" className="ml-auto">Live</Badge>
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Real-time team updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow" data-testid={`activity-${activity.id}`}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs">
                            {getInitials(activity.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.resource_type)}
                            <p className="text-sm dark:text-gray-200">
                              <span className="font-semibold">{activity.user_name}</span>
                              {' '}{activity.action}{' '}
                              <span className="text-gray-600 dark:text-gray-400">{activity.resource_type}</span>
                            </p>
                          </div>
                          {activity.details && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{activity.details}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Online Users */}
            <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="online-users">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  Online Now
                  <Badge variant="outline" className="ml-auto">{onlineUsers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {onlineUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-xs">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate dark:text-gray-200">{u.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-md dark:bg-gray-800" data-testid="notifications-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Notifications
                  {notifications.length > 0 && (
                    <Badge variant="destructive" className="ml-auto">{notifications.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm font-semibold dark:text-gray-200">{notif.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20" data-testid="quick-actions">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Quick Team Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Start Chat</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Team Meeting</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Bell className="w-6 h-6" />
                <span className="text-sm">Send Alert</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Activity className="w-6 h-6" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Collaboration;