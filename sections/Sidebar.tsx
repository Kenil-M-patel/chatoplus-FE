import { UserListItem } from "@/components/UserListItem";
import UserListSkeleton from "@/components/UserListSkeleton";
import { LoadingContacts } from "@/components/LoadingSpinner";
import Image from "next/image";
import { FaSearch, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { SideBarProps, User, AI_USER } from "@/constants/constants";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import { getAllUsers } from "@/store/contactsSlice";
import { RootState } from "@/store/ReduxProvider";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { handleError, handleSuccess } from "@/utils/utils";

const Sidebar: React.FC<SideBarProps> = ({
  token,
  setUsers,
  selectedUser,
  setSelectedUser,
  isMobileView,
  setShowChatViewMobile,
  currentUser,
  users,
  showChatViewMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const contactsUsers = useSelector((state: RootState) => state.contacts.users);
  const isContactsLoading = useSelector((state: RootState) => state.contacts.isLoading);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    setUsers(contactsUsers);
  }, [contactsUsers, setUsers]);

  const handleSelectUser = (user: User) => {
    if (selectedUser?.id !== user.id) {
      setSelectedUser(user);
    } else if (isMobileView) {
      setShowChatViewMobile(true);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
    handleSuccess("Logged out successfully");
  };

  const filteredUsers = users.filter(
    (user) =>
      currentUser &&
      searchTerm &&
      user.user_name &&
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      className={` ${
        isMobileView && showChatViewMobile ? "hidden" : "flex"
      } flex-col md:w-80 lg:w-96 w-full border-r border-gray-200 bg-white md:rounded-l-2xl md:m-2 md:my-2 md:ml-2 shadow-lg overflow-hidden relative`}
    >
      {isContactsLoading && users.length === 0 && <LoadingContacts />}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text transition-all duration-300 ease-in-out">
          CHAT<span className="text-gray-800 drop-shadow-md">OPLUS</span>
        </h1>
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500 text-sm"
            disabled={isContactsLoading && users.length === 0}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isContactsLoading && users.length === 0 ? (
          <UserListSkeleton />
        ) : (
          <ul className="p-3 space-y-1.5">
            {filteredUsers.length > 0
              ? filteredUsers.map((user) => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    onSelectUser={handleSelectUser}
                    isSelected={selectedUser?.id === user.id}
                  />
                ))
              : [...users]
                  .sort((a, b) => {
                    if (!a.last_message_time) return 1;
                    if (!b.last_message_time) return -1;
                    return (
                      new Date(b.last_message_time!).getTime() -
                      new Date(a.last_message_time!).getTime()
                    );
                  })
                  .map(
                    (user) =>
                      user.last_message && (
                        <UserListItem
                          key={user.id}
                          user={user}
                          onSelectUser={handleSelectUser}
                          isSelected={selectedUser?.id === user.id}
                        />
                      )
                  )}
            {users.length > 0 &&
              !users.some((user) => user.last_message) &&
              !searchTerm && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-blue-500 text-xl" />
                  </div>
                  <p className="text-gray-700 text-sm font-medium mb-2">
                    Start a Conversation
                  </p>
                  <p className="text-gray-500 text-sm max-w-[200px]">
                    Search for users above and start chatting to see your
                    conversations here
                  </p>
                </div>
              )}
            {users.length === 0 && !isContactsLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <FaUserAlt className="text-gray-500 text-xl" />
                </div>
                <p className="text-gray-500 text-sm">
                  {users.length > 0
                    ? "No contacts match your search"
                    : "No contacts available"}
                </p>
                {users.length > 0 && (
                  <p className="text-gray-400 text-xs mt-1">
                    Try adjusting your search
                  </p>
                )}
              </div>
            )}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 mt-auto">
        {currentUser && (
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center space-x-2.5 group cursor-pointer"
              onClick={() =>
                alert("Navigate to profile page for: " + currentUser.user_name)
              }
            >
              {currentUser.image_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={currentUser.image_url}
                    alt={currentUser.user_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ring-2 ring-transparent group-hover:ring-sky-400"
                    width={40}
                    height={40}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 group-hover:ring-blue-400 ring-2 ring-transparent">
                  <FaUserAlt size={20} />
                </div>
              )}
              <span className="font-semibold text-sm text-gray-800 group-hover:text-blue-600">
                {currentUser.user_name}
              </span>
            </div>
            <button
              className="p-2 rounded-full hover:bg-slate-700 transition-colors cursor-pointer"
              title="AI Assistant"
              onClick={() => {
                setSelectedUser(AI_USER);
                setShowChatViewMobile(true);
              }}
            >
              <Image
                src="/ai.png"
                width={30}
                height={30}
                alt="AI Assistant"
                className="invert group-hover:invert-0"
              />
            </button>
          </div>
        )}
        <div className="flex items-center justify-end">
                      <button
              onClick={handleLogout}
              className="flex items-center space-x-2 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 
               active:bg-red-100 rounded-lg transition-colors duration-150 ease-in-out group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-white cursor-pointer"
              title="Logout"
            >
            <span>Logout</span>
            <FiLogOut
              size={18}
              className="transition-transform duration-150 ease-in-out group-hover:scale-110"
            />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
