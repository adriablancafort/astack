import { type ComponentType, lazy, Suspense } from "react"
import { BrowserRouter, type RouteObject, useRoutes } from "react-router"

type RouteModule = {
  default: ComponentType<object>
}

type ModuleLoader = () => Promise<RouteModule>

type RouteNode = {
  page?: ModuleLoader
  layout?: ModuleLoader
  children: Map<string, RouteNode>
}

const ROUTE_FILE_RE = /^\.\/routes\/(?:(.*)\/)?(page|layout)\.tsx$/

const routeModuleLoaders = import.meta.glob<RouteModule>([
  "./routes/{page,layout}.tsx",
  "./routes/**/{page,layout}.tsx",
])

const routeConfig = buildRouteConfig()

function AppRoutes() {
  return useRoutes(routeConfig)
}

export function Routes() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

function buildRouteConfig(): RouteObject[] {
  const rootNode = createRouteNode()

  for (const [modulePath, loader] of Object.entries(routeModuleLoaders).sort(
    ([leftPath], [rightPath]) => leftPath.localeCompare(rightPath)
  )) {
    const match = modulePath.match(ROUTE_FILE_RE)

    if (!match) {
      continue
    }

    const [, directory = "", moduleKind] = match
    const currentNode = directory
      ? directory.split("/").reduce((node, segment) => {
          let childNode = node.children.get(segment)

          if (!childNode) {
            childNode = createRouteNode()
            node.children.set(segment, childNode)
          }

          return childNode
        }, rootNode)
      : rootNode

    currentNode[moduleKind as "layout" | "page"] = loader
  }

  const rootRoute = buildRouteObject(rootNode, true)

  return rootRoute ? [rootRoute] : []
}

function createRouteNode(): RouteNode {
  return {
    children: new Map(),
  }
}

function buildRouteObject(
  node: RouteNode,
  isRoot = false,
  segment = ""
): RouteObject | null {
  const childRoutes = [...node.children.entries()]
    .sort(([leftSegment], [rightSegment]) =>
      compareSegments(leftSegment, rightSegment)
    )
    .map(([childSegment, childNode]) =>
      buildRouteObject(childNode, false, childSegment)
    )
    .filter((route): route is RouteObject => route !== null)

  const nestedRoutes = [...childRoutes]

  if (node.page && (isRoot || node.layout || childRoutes.length > 0)) {
    nestedRoutes.unshift({
      index: true,
      element: createRouteElement(node.page),
    })
  }

  const path = isRoot ? undefined : toRoutePath(segment)

  if (node.layout) {
    return {
      path,
      element: createRouteElement(node.layout),
      children: nestedRoutes.length > 0 ? nestedRoutes : undefined,
    }
  }

  if (nestedRoutes.length > 0) {
    return {
      path,
      children: nestedRoutes,
    }
  }

  if (node.page) {
    return {
      path,
      element: createRouteElement(node.page),
    }
  }

  return null
}

function compareSegments(leftSegment: string, rightSegment: string) {
  const rankDifference = rankSegment(leftSegment) - rankSegment(rightSegment)

  if (rankDifference !== 0) {
    return rankDifference
  }

  return leftSegment.localeCompare(rightSegment)
}

function rankSegment(segment: string) {
  const path = toRoutePath(segment)

  if (!path) {
    return 0
  }

  if (path === "*") {
    return 30
  }

  if (path.startsWith(":")) {
    return 20
  }

  return 10
}

function toRoutePath(segment: string) {
  if (/^\(.+\)$/.test(segment)) {
    return undefined
  }

  if (/^\[\.\.\.[^\]]+\]$/.test(segment)) {
    return "*"
  }

  if (/^\[[^\]]+\]$/.test(segment)) {
    return `:${segment.slice(1, -1)}`
  }

  return segment
}

function createRouteElement(loader: ModuleLoader) {
  const LazyComponent = lazy(loader)

  return <LazyComponent />
}
