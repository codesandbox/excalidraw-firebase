declare module "@excalidraw/excalidraw" {
  let Excalidraw: (props: {
    ref: React.Ref<HTMLDivElement>;
    width: number | undefined;
    height: number | undefined;
    initialData: any;
    zenModeEnabled: boolean;
    viewModeEnabled: boolean;
    onChange: (elements: any[], state: any) => void;
  }) => any;

  export default Excalidraw;
}
