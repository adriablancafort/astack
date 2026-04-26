import { Search } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"

export default function Page() {
  return (
    <Empty className="mx-auto max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle className="text-xl">Page not found</EmptyTitle>
        <EmptyDescription>
          The page you're looking for doesn't exist or was moved
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="secondary" render={<Link to="/" />}>
          Return Home
        </Button>
      </EmptyContent>
    </Empty>
  )
}
