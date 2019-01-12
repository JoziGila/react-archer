// @flow

import React from 'react';
import Point from './Point';

type Props = {
  startingPoint: Point,
  startingAnchor: AnchorPositionType,
  endingPoint: Point,
  endingAnchor: AnchorPositionType,
  strokeColor: string,
  arrowLength: number,
  strokeWidth: number,
  arrowLabel?: ?React$Node,
  arrowMarkerId: string,
};

function computeAnchorDirectionVector(anchor) {
  switch (anchor) {
    case 'left':
      return { arrowX: -1, arrowY: 0 };
    case 'right':
      return { arrowX: 1, arrowY: 0 };
    case 'top':
      return { arrowX: 0, arrowY: -1 };
    case 'bottom':
      return { arrowX: 0, arrowY: 1 };
    default:
      return { arrowX: 0, arrowY: 0 };
  }
}

export function computeEndingPointAccordingToArrow(
  end: Point,
  arrowLength: number,
  strokeWidth: number,
  endingAnchor: AnchorPositionType,
) {
  const { arrowX, arrowY } = computeAnchorDirectionVector(endingAnchor);

  const x = end.x + (arrowX * arrowLength * strokeWidth) / 2;
  const y = end.y + (arrowY * arrowLength * strokeWidth) / 2;

  return { x, y };
}

export function computeAnchor(
  point: Point,
  anchorPosition: AnchorPositionType
) {
  const aDirection = computeAnchorDirectionVector(anchorPosition);
  const anchor = {
    x: point.x + (aDirection.arrowX * 30),
    y: point.y + (aDirection.arrowY * 30)
  }
  return anchor;
}

export function computeAnchors(
  start: Point,
  end: Point,
  startingAnchor: AnchorPositionType,
  endingAnchor: AnchorPositionType
) {
  const a1 = computeAnchor(start, startingAnchor);
  const a2 = computeAnchor(end, endingAnchor);

  return {a1, a2}
}

export function computeBreakpoint(
  start: Point,
  end: Point,
  anchorPosition: AnchorPositionType,
  isStart: boolean
) {
  const b = {
    x: end.y < start.y ? mX : point.x,
    y: end.y < start.y ? point.y : point.x
  }
}

export function computeBreakpoints(
  start: Point,
  end: Point,
  startingAnchor: AnchorPositionType,
  endingAnchor: AnchorPositionType
) {
  const mX = (start.x + end.x) / 2;
  const mY = (start.y + end.y) / 2;

  let b1 = {};
  let b2 = {};

  switch (startingAnchor) {
    case "top":
    case "bottom":
      b1 = {
        x: end.y < start.y ? mX : start.x,
        y: end.y < start.y ? start.y : start.x
      }
      break;
    case "right":
    case "left":
      b1 = {
        x: end.x > start.x ? mX : start.x,
        y: end.x > start.x ? start.y : mY
      }
  }

  switch (endingAnchor) {
    case "top":
    case "bottom":
      b2 = {
        x: end.y < start.y ? mX : end.x,
        y: end.y < start.y ? end.y : mY
      }
      break;
    case "right":
    case "left":
      b2 = {
        x: end.x > start.x ? mX : end.x,
        y: end.x > start.x ? end.y : mY
      }
      break;
  }
  return { b1, b2 };
}

export function computeStartingAnchorPosition(
  xs: number,
  ys: number,
  xe: number,
  ye: number,
  startingAnchor: AnchorPositionType,
): { xa1: number, ya1: number } {
  if (startingAnchor === 'top' || startingAnchor === 'bottom') {
    return {
      xa1: xs,
      ya1: ys + (ye - ys) / 2,
    };
  }
  if (startingAnchor === 'left' || startingAnchor === 'right') {
    return {
      xa1: xs + (xe - xs) / 2,
      ya1: ys,
    };
  }

  return { xa1: xs, ya1: ys };
}

export function computeEndingAnchorPosition(
  xs: number,
  ys: number,
  xe: number,
  ye: number,
  endingAnchor: AnchorPositionType,
): { xa2: number, ya2: number } {
  if (endingAnchor === 'top' || endingAnchor === 'bottom') {
    return {
      xa2: xe,
      ya2: ye - (ye - ys) / 2,
    };
  }
  if (endingAnchor === 'left' || endingAnchor === 'right') {
    return {
      xa2: xe - (xe - xs) / 2,
      ya2: ye,
    };
  }

  return { xa2: xe, ya2: ye };
}

export function computeLabelDimensions(
  xs: number,
  ys: number,
  xe: number,
  ye: number,
): { xl: number, yl: number, wl: number, hl: number } {
  const wl = Math.abs(xe - xs);
  const hl = Math.abs(ye - ys);

  const xl = xe > xs ? xs : xe;
  const yl = ye > ys ? ys : ye;

  return {
    xl,
    yl,
    wl,
    hl,
  };
}

const SvgArrow = ({
  startingPoint,
  startingAnchor,
  endingPoint,
  endingAnchor,
  strokeColor,
  arrowLength,
  strokeWidth,
  arrowLabel,
  arrowMarkerId,
}: Props) => {
  const actualArrowLength = arrowLength * 2;

  const actualEnd = computeEndingPointAccordingToArrow(
    endingPoint,
    actualArrowLength,
    strokeWidth,
    endingAnchor,
  );

  const { a1, a2 } = computeAnchors(
    startingPoint,
    actualEnd,
    startingAnchor,
    endingAnchor
  )

  const { b1, b2 } = computeBreakpoints(
    a1,
    a2,
    startingAnchor,
    endingAnchor
  )

  console.log({a1, a2})

  const pathString =
    `M${startingPoint.x},${startingPoint.y} ` + 
    `L${a1.x},${a1.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${a2.x},${a2.y}` + 
    ` ${actualEnd.x},${actualEnd.y}`;

  const { xl, yl, wl, hl } = computeLabelDimensions(startingPoint.x, startingPoint.y, actualEnd.x, actualEnd.y);

  return (
    <g>
      <path
        d={pathString}
        style={{ fill: 'none', stroke: strokeColor, strokeWidth }}
        markerEnd={`url(${location.href}#${arrowMarkerId})`}
      />
      {arrowLabel && (
        <foreignObject x={xl} y={yl} width={wl} height={hl}>
          <div
            style={{
              width: wl,
              height: hl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div>{arrowLabel}</div>
          </div>
        </foreignObject>
          )}
    </g>
  );
};

export default SvgArrow;
