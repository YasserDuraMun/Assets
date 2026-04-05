# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Copy project file and restore dependencies
COPY ["Assets.csproj", "."]
RUN dotnet restore "Assets.csproj"

# Copy everything else and build
COPY . .

# Build frontend
WORKDIR /src/ClientApp
RUN npm install
RUN npm run build

# Build backend
WORKDIR /src
RUN dotnet build "Assets.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Assets.csproj" -c Release -o /app/publish

# Copy frontend build to wwwroot
RUN cp -r /src/ClientApp/dist/* /app/publish/wwwroot/

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Assets.dll"]