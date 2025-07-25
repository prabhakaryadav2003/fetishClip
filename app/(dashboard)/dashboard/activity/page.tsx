import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  PlaySquare,
  CreditCard,
  Video,
  XCircle,
} from "lucide-react";
import { ActivityType } from "@/lib/db/schema";
import { getActivityLogs } from "@/lib/db/queries";

const iconMap: Record<ActivityType, React.ElementType> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.WATCH_VIDEO]: PlaySquare,
  [ActivityType.SUBSCRIBE]: CreditCard,
  [ActivityType.UNSUBSCRIBE]: XCircle,
  [ActivityType.PAYMENT_FAILED]: AlertCircle,
  [ActivityType.ADD_VIDEO]: Video,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function parseAction(action: string): ActivityType {
  const base = action.split(":")[0] as ActivityType;
  return base in ActivityType
    ? (base as ActivityType)
    : ActivityType.UPDATE_ACCOUNT;
}

function formatAction(actionRaw: string): string {
  const [action, payload] = actionRaw.split(":");
  switch (action) {
    case ActivityType.SIGN_UP:
      return "You signed up";
    case ActivityType.SIGN_IN:
      return "You signed in";
    case ActivityType.SIGN_OUT:
      return "You signed out";
    case ActivityType.UPDATE_PASSWORD:
      return "You changed your password";
    case ActivityType.DELETE_ACCOUNT:
      return "You deleted your account";
    case ActivityType.UPDATE_ACCOUNT:
      return "You updated your account";
    case ActivityType.WATCH_VIDEO:
      return "You watched a video";
    case ActivityType.ADD_VIDEO:
      return "You added a video";
    case ActivityType.SUBSCRIBE:
      return "Subscription started";
    case ActivityType.UNSUBSCRIBE:
      return "Subscription cancelled";
    case ActivityType.PAYMENT_FAILED:
      return "Payment failed";
    default:
      return "Unknown action occurred";
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const actionType = parseAction(log.action);
                const Icon = iconMap[actionType] || Settings;
                const formattedAction = formatAction(log.action);

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like signing in, updating your account,
                subscribing, or adding videos, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
