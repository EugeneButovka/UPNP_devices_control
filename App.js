import React from "react";
import {
    Button,
    Text,
    Container,
    Header,
    Title,
    Content,
    Footer,
    FooterTab,
    Left,
    Right,
    Body,
    Icon} from "native-base";

import UpnpControlHub from "./components/UpnpControlHub";

export default function App() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name="menu" />
            </Button>
          </Left>
          <Body
            style={{
                        flex: 3,
                        flexDirection: "row",
                        justifyContent: "center"
                    }}
          >
            <Right>
              <Title>UPnP control Hub!</Title>
            </Right>
          </Body>
        </Header>
        <Content>
          <UpnpControlHub />
        </Content>
        <Footer>
          <FooterTab>
            <Button full>
              <Text>About</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
}
