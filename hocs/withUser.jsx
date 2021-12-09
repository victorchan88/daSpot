import { useAuthUser } from 'next-firebase-auth';

export const withUser = (Component) => {
  const withUserComponent = (props) => {
    const user = useAuthUser();

    return <Component {...props} user={user} />;
  };

  return withUserComponent;
};
