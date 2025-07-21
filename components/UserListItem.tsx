import { UserListItemProps } from "@/constants/constants";
import { formatTimeStamp } from "@/utils/utils";
import Image from "next/image";
import { FaUserAlt } from "react-icons/fa";

export const UserListItem = ({
  user,
  onSelectUser,
  isSelected,
}: UserListItemProps) => (
  <li
    onClick={() => onSelectUser(user)}
    className={`flex items-center p-3 space-x-3.5 cursor-pointer rounded-xl transition-all duration-200 ease-in-out group
                  ${
                    isSelected
                      ? "bg-blue-600 shadow-lg"
                      : "hover:bg-gray-100"
                  }`}
  >
    <div className="relative flex-shrink-0">
      {user.image_url ? (
        <div className="w-11 h-11 rounded-full overflow-hidden">
          <Image
            src={user.image_url}
            alt={user.user_name}
            className="w-full h-full object-cover border-2 border-transparent group-hover:border-blue-600 transition-all duration-200"
            width={44}
            height={44}
          />
        </div>
      ) : (
        <FaUserAlt className="w-11 h-11 text-gray-500" />
      )}
      {user.is_online && (
        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-white ring-1 ring-green-400"></span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={`font-semibold truncate ${
          isSelected ? "text-white" : "text-gray-800"
        }`}
      >
        {user.user_name}
      </p>
      {user.last_message && (
        <p
          className={`text-xs truncate ${
            isSelected ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {user.last_message}
        </p>
      )}
    </div>
    {user.last_message_time && (
      <div className="text-xs text-gray-500">
        {formatTimeStamp(new Date(user.last_message_time))}
      </div>
    )}
  </li>
);
