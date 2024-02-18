import { Avatar, Button } from "@chakra-ui/react";
import { Rating } from "@smastrom/react-rating";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { type RouterOutputs, api } from "@/utils/api";

type ReviewProps = {
  review: RouterOutputs["products"]["getProductReviews"][number];
};

export default function Review({ review }: ReviewProps) {
  const session = useSession();
  const utils = api.useUtils();
  const { mutate: deleteReview } = api.products.deleteReview.useMutation({
    onSuccess: () => {
      void utils.products.getProductById.invalidate({ id: review.productId });
      void utils.products.getProductReviews.invalidate({
        productId: review.productId,
      });
    },
  });

  const handleDelete = () => {
    deleteReview({ id: review.id });
  };

  const isAuthor = session.data?.user.id === review.author.id;

  return (
    <div
      className={classNames("flex space-x-4 text-sm text-gray-500", {
        "bg-yellow-50": isAuthor,
      })}
    >
      <div className="flex-none px-2 py-10">
        <Avatar src={review.author.image!} name={review.author.name!} />
      </div>
      <div className={classNames("border-t border-gray-200", "space-y-1 px-2 py-10")}>
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-gray-900">{review.author.name}</h3>
          {isAuthor && (
            <Button onClick={handleDelete} size="xs">
              delete my review
            </Button>
          )}
        </div>
        <p>
          <time dateTime={review.date.toUTCString()}>{review.date.toLocaleString()}</time>
        </p>

        <Rating value={Math.round(review.rating)} style={{ maxWidth: 100 }} readOnly />
        <p className="sr-only">{Math.round(review.rating)} out of 5 stars</p>

        <div className="prose prose-sm mt-4 max-w-none text-gray-500">{review.content}</div>
      </div>
    </div>
  );
}
