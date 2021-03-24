declare module "@excalidraw/excalidraw" {
  let Excalidraw: (props: {
    ref: React.Ref<HTMLDivElement>;
    width: number | undefined;
    height: number | undefined;
    initialData?: any;
    onChange: (elements: any[], state: any) => void;
    viewModeEnabled: boolean;
  }) => any;

  export default Excalidraw;

  export function getSceneVersion(els: any[]): number;
}
