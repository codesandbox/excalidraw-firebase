import * as React from "react";
import { match, usePromise } from "react-states";
import { ExcalidrawMetadata } from "../../environment-interface/storage";
import formatDistanceToNow from "date-fns/formatDistanceToNow";

import { User } from "../../environment-interface/authentication";
import { useEnvironment } from "../../environment-interface";

export const ExcalidrawPreview = ({
  user,
  metadata,
}: {
  user: User;
  metadata: ExcalidrawMetadata;
}) => {
  const { storage } = useEnvironment();
  const [preview] = usePromise(
    () => storage.getImageSrc(user.uid, metadata.id),
    [user.uid, metadata.id]
  );

  const renderPreview = (background: string) => (
    <div className="w-full h-full" style={{ background }}></div>
  );

  return (
    <a href={`/${user.uid}/${metadata.id}`}>
      <div className="relative rounded-lg group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-cyan-500">
        <div className="mb-2 flex items-center">
          {user.avatarUrl ? (
            <img
              className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0 shadow-sm mr-3"
              src={user.avatarUrl}
              alt=""
            />
          ) : null}
          <h3 className="text-lg font-medium">
            <span className="absolute inset-0" aria-hidden="true" />
            {metadata.title || ""}
          </h3>
        </div>
        <div className="relative h-32">
          {match(preview, {
            PENDING: () => <div className="lds-dual-ring"></div>,
            RESOLVED: ({ value: src }) =>
              renderPreview(`center / contain no-repeat url(${src})`),
            REJECTED: () => renderPreview("#FFF"),
          })}
        </div>
        <div className="absolute bottom-6 right-6 flex justify-between items-center">
          <span className="ml-auto bg-gray-200 text-gray-500 px-2 py-1 rounded-md z-10 h-8 flex items-center text-sm shadow-sm">
            {formatDistanceToNow(metadata.last_updated)} ago
          </span>
        </div>
      </div>
    </a>
  );
};
