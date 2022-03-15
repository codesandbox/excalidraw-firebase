import React from "react";
import { match } from "react-states";
import { useNavigation } from "../../features/Navigation";

export const Navigation = () => {
  const [state, dispatch] = useNavigation();

  return (
    <div className="border-b border-gray-200 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="flex-1 flex items-center">
        <span className="p-2 bg-gray-900 rounded-md w-10 h-10 block mr-3">
          <svg
            aria-label="CodeSandbox"
            role="presentation"
            x="0px"
            y="0px"
            width="50px"
            height="50px"
            viewBox="0 0 452 452"
            style={{
              verticalAlign: "middle",
              marginTop: "-21px",
              marginLeft: "-21px",
            }}
          >
            <path
              clipRule="evenodd"
              d="m200 400h200v-200h-200zm179.545-20.455v-159.09h-159.09v159.09z"
              fill="#FFFF"
              fillRule="evenodd"
            />
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
              dispatch({ type: "SHOW_ALL_EXCALIDRAWS" });
            }}
            className={`${match(state, {
              ALL_EXCALIDRAWS: () => "font-bold",
              CREATE_EXCALIDRAW_ERROR: () => "",
              CREATING_EXCALIDRAW: () => "opacity-50",
              EXCALIDRAW_CREATED: () => "opacity-50",
              USER_EXCALIDRAWS: () => "",
            })} order-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500  sm:order-1 sm:ml-3`}
          >
            All Excalidraws
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SHOW_MY_EXCALIDRAWSS" });
            }}
            className={`${match(state, {
              ALL_EXCALIDRAWS: () => "",
              CREATE_EXCALIDRAW_ERROR: () => "",
              CREATING_EXCALIDRAW: () => "opacity-50",
              EXCALIDRAW_CREATED: () => "opacity-50",
              USER_EXCALIDRAWS: () => "font-bold",
            })} order-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500  sm:order-1 sm:ml-3`}
          >
            My Excalidraws
          </button>
        </div>
        <div className="mt-4 flex sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "CREATE_EXCALIDRAW" });
            }}
            className="order-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:order-1 sm:ml-3"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
