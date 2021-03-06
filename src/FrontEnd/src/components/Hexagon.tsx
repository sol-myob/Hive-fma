import { FunctionComponent, h } from 'preact';

type Props = { hidden?: boolean; [rest: string]: unknown };
const Hexagon: FunctionComponent<Props> = (props) => {
  const { hidden, children, svgs, ...rest } = props;
  if (hidden) rest.role = 'none';
  return (
    <div {...rest}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <use href="#hex" />
        {svgs}
      </svg>
      {children}
    </div>
  );
};

Hexagon.displayName = 'Cell';
export default Hexagon;
