import Image from 'next/image';

type Props = {
  name: string;
  picture: string;
};

const Avatar = ({ name, picture }: Props) => {
  return (
    <div className="flex items-center">
      <div className="relative w-10 h-10 mr-4">
        <Image
          src={picture}
          className="rounded-full"
          alt={name}
          fill
          sizes="40px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="text-sm font-medium text-neutral-700">{name}</div>
    </div>
  );
};

export default Avatar; 