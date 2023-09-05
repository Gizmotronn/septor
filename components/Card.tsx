export default function Card({children,noPadding}) {
  let classes = 'bg-white shadow-sm shadow-gray-300 rounded-3xl mb-5';
  if (!noPadding) {
    classes += ' p-4';
  }
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export function ProfileCard({children,noPadding}) {
  let classes = 'bg-white shadow-md shadow-gray-300 rounded-md mb-5 mx-6 w-full';
  if (!noPadding) {
    classes += ' p-4';
  }
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export function createPlanetCard({children,noPadding}) {
  let classes = 'bg-white shadow-md shadow-gray-300 rounded-md mb-5 mx-60';
  if (!noPadding) {
    classes += ' p-4';
  }
  return (
    <div className={classes}>
      {children}
    </div>
  );
}