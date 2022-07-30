import React from "react";
import { match } from "react-states";
import { useAuthenticatedAuth } from "../../hooks/useAuth";
import { useCreateExcalidraw } from "../../hooks/useCreateExcalidraw";

import { useRouter } from "../../hooks/useRouter";

export const Navigation: React.FC = () => {
  const auth = useAuthenticatedAuth();
  const router = useRouter();
  const [createExcalidrawState, createExcalidraw] = useCreateExcalidraw();

  return (
    <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center">
        <span className="p-2 bg-gray-900 rounded-md w-10 h-10 block mr-3">
          <svg
            aria-label="CodeSandbox"
            role="presentation"
            x="0px"
            y="0px"
            width="35px"
            height="24px"
            viewBox="0 0 452 452"
            style={{ verticalAlign: "middle", marginLeft: "-6px" }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M226 228.286V447.293C229.813 447.293 232.319 446.466 235.742 444.51L411.107 344.302C418.031 340.333 420.855 334.19 420.855 326.208V123.008C420.855 119.004 420.011 116.609 418.066 113.266L231.61 218.619C228.141 220.601 226 224.29 226 228.286ZM323.425 354.044C323.425 359.611 321.337 362.395 316.466 365.178L258.011 398.581C253.836 401.365 248.269 399.973 248.269 394.406V245.485C248.269 241.501 251.775 236.338 255.227 234.351L388.839 157.803C392.55 155.667 395.797 159.088 395.797 163.37V242.701C395.797 246.814 393.859 250.509 390.23 252.444L330.384 284.455C326.755 286.39 323.425 290.085 323.425 294.197V354.044Z"
              fill="#B8B9BA"
            ></path>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M31.1505 326.208V123.008C31.1505 115.017 35.3465 107.488 42.2848 103.523L212.082 7.49014C215.74 5.55143 221.825 4.7066 226 4.7066C230.175 4.7066 236.617 5.74065 239.918 7.49017L408.324 103.523C411.656 105.492 416.181 110.027 418.066 113.266L231.567 219.041C228.098 221.023 226 224.788 226 228.784V447.293C222.187 447.293 218.289 446.466 214.866 444.51L43.6766 345.693C36.7382 341.729 31.1505 334.2 31.1505 326.208ZM56.2026 163.37V242.701C56.2026 248.269 57.5944 251.052 63.1615 253.836L121.616 287.238C127.184 290.022 128.575 294.197 128.575 298.373V354.044C128.575 359.611 129.967 362.395 135.534 365.178L193.989 398.581C199.556 401.364 203.732 399.973 203.732 394.406V245.485C203.732 241.31 202.34 237.134 196.773 234.351L65.9451 159.194C61.7697 156.411 56.2026 157.803 56.2026 163.37ZM284.455 68.7286L232.959 97.956C228.784 100.74 223.217 100.74 219.041 97.956L167.545 68.7286C164.155 66.8127 159.806 66.8225 156.411 68.7286L92.3889 104.915C86.8218 107.699 86.8218 113.266 92.3889 116.049L220.433 189.814C223.86 191.776 228.14 191.776 231.567 189.814L359.611 116.049C363.787 113.266 365.178 107.699 359.611 104.915L295.589 68.7286C292.194 66.8225 287.845 66.8127 284.455 68.7286Z"
              fill="#F2F2F2"
            ></path>
          </svg>
        </span>
        <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
          CodeSandbox Excalidraw
        </h1>
      </div>
      <div className="flex">
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => {
              router.open({
                name: "ALL_EXCALIDRAWS",
              });
            }}
            className={`${match(createExcalidrawState, {
              IDLE: () => "",
              REJECTED: () => "",
              PENDING: () => "opacity-50",
              RESOLVED: () => "opacity-50",
            })} ${
              router.page.name === "ALL_EXCALIDRAWS" ? "font-bold" : ""
            } order-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500  sm:order-1 sm:ml-3`}
          >
            All Excalidraws
          </button>
          <button
            type="button"
            onClick={() => {
              router.open({
                name: "USER_EXCALIDRAWS",
                userId: auth.user.uid,
              });
            }}
            className={`${match(createExcalidrawState, {
              IDLE: () => "",
              REJECTED: () => "",
              PENDING: () => "opacity-50",
              RESOLVED: () => "opacity-50",
            })} ${
              router.page.name === "USER_EXCALIDRAWS" ? "font-bold" : ""
            } order-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500  sm:order-1 sm:ml-3`}
          >
            My Excalidraws
          </button>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => createExcalidraw()}
            className="order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:order-1 sm:ml-3"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
